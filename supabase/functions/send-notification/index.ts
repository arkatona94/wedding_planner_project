import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
        const { weddingId, guestId, type, channel, recipient, subject, html, text } = await req.json()

        // 1. Log the attempt
        const { data: logEntry, error: logError } = await supabase
            .from('communication_logs')
            .insert({
                wedding_id: weddingId,
                guest_id: guestId || null,
                type,
                channel,
                recipient,
                subject: channel === 'email' ? subject : null,
                content: channel === 'email' ? html : text,
                status: 'pending'
            })
            .select()
            .single()

        if (logError) throw logError

        // 2. Handle SMS (Twilio)
        if (channel === 'sms') {
            if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
                console.log("MOCK MODE: Twilio credentials not fully set.")
                await supabase
                    .from('communication_logs')
                    .update({ status: 'sent', error_message: 'MOCK MODE: Missing Twilio Credentials' })
                    .eq('id', logEntry.id)

                return new Response(JSON.stringify({
                    message: "SMS logged in mock-mode (Check environment variables)",
                    success: true
                }), {
                    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
                    status: 200,
                })
            }

            const authString = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
            const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authString}`,
                },
                body: new URLSearchParams({
                    To: recipient,
                    From: TWILIO_PHONE_NUMBER,
                    Body: text || "Wedding Update",
                }),
            })

            const resData = await res.json()

            if (res.ok) {
                await supabase
                    .from('communication_logs')
                    .update({ status: 'sent', message_id: resData.sid })
                    .eq('id', logEntry.id)

                return new Response(JSON.stringify({ success: true, id: resData.sid }), {
                    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
                    status: 200,
                })
            } else {
                await supabase
                    .from('communication_logs')
                    .update({ status: 'failed', error_message: resData.message })
                    .eq('id', logEntry.id)

                return new Response(JSON.stringify({ success: false, error: resData.message }), {
                    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
                    status: 500,
                })
            }
        }

        // 3. Handle Email (Resend)
        if (channel === 'email') {
            if (!RESEND_API_KEY) {
                console.log("MOCK MODE: No RESEND_API_KEY set.")
                await supabase
                    .from('communication_logs')
                    .update({ status: 'sent', error_message: 'MOCK MODE: No Resend API Key' })
                    .eq('id', logEntry.id)

                return new Response(JSON.stringify({
                    message: "Email logged and mock-sent (Add RESEND_API_KEY for real sending)",
                    success: true
                }), {
                    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
                    status: 200,
                })
            }

            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'EverAfter Wedding <onboarding@resend.dev>',
                    to: recipient,
                    subject,
                    html,
                }),
            })

            const resData = await res.json()

            if (res.ok) {
                await supabase
                    .from('communication_logs')
                    .update({ status: 'sent', message_id: resData.id })
                    .eq('id', logEntry.id)

                return new Response(JSON.stringify({ success: true, id: resData.id }), {
                    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
                    status: 200,
                })
            } else {
                await supabase
                    .from('communication_logs')
                    .update({ status: 'failed', error_message: resData.message })
                    .eq('id', logEntry.id)

                return new Response(JSON.stringify({ success: false, error: resData.message }), {
                    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
                    status: 500,
                })
            }
        }

        throw new Error(`Invalid channel: ${channel}`)

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
            status: 400,
        })
    }
})
