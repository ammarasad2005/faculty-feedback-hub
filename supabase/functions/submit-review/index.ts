import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limit: 1 review per 5 minutes per IP
const RATE_LIMIT_MINUTES = 5

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback - this shouldn't happen in production
  return 'unknown'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { facultyId, rating, comment } = await req.json()

    // Validate input
    if (!facultyId || typeof facultyId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid faculty ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'Rating must be between 1 and 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Comment is optional, but if provided, must be at most 500 characters
    if (comment !== undefined && comment !== null && comment !== '') {
      if (typeof comment !== 'string' || comment.length > 500) {
        return new Response(
          JSON.stringify({ error: 'Comment must be at most 500 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create Supabase client with service role for rate limit table access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get and hash the client IP
    const clientIP = getClientIP(req)
    const ipHash = await hashIP(clientIP)

    // Check rate limit
    const { data: rateLimit } = await supabaseAdmin
      .from('rate_limits')
      .select('last_review_at, review_count')
      .eq('ip_hash', ipHash)
      .single()

    if (rateLimit) {
      const lastReviewAt = new Date(rateLimit.last_review_at)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastReviewAt.getTime()) / (1000 * 60)

      if (diffMinutes < RATE_LIMIT_MINUTES) {
        const waitTime = Math.ceil(RATE_LIMIT_MINUTES - diffMinutes)
        return new Response(
          JSON.stringify({ 
            error: `Please wait ${waitTime} minute${waitTime > 1 ? 's' : ''} before submitting another review.` 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Insert the review
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        faculty_id: facultyId,
        rating,
        comment: comment?.trim() || null,
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Review insert error:', reviewError)
      return new Response(
        JSON.stringify({ error: 'Failed to submit review' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update rate limit record
    const { error: rateLimitError } = await supabaseAdmin
      .from('rate_limits')
      .upsert({
        ip_hash: ipHash,
        last_review_at: new Date().toISOString(),
        review_count: (rateLimit?.review_count || 0) + 1,
      }, {
        onConflict: 'ip_hash',
      })

    if (rateLimitError) {
      console.error('Rate limit update error:', rateLimitError)
      // Don't fail the request if rate limit update fails
    }

    return new Response(
      JSON.stringify({ success: true, data: review }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
