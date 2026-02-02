import Anthropic from '@anthropic-ai/sdk'
import Airtable from 'airtable'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)

const SYSTEM_PROMPT = `Tu es l'assistant de réservation d'un hôtel. Tu es aimable et professionnel.

Chambres disponibles:
- Chambre Standard: 80€/nuit
- Chambre Deluxe: 120€/nuit  
- Suite: 200€/nuit

Pour faire une réservation, tu dois collecter:
1. Type de chambre souhaité
2. Date d'arrivée
3. Date de départ
4. Nom du client
5. Email du client

Quand tu as toutes les infos, confirme la réservation.
Réponds toujours en français et sois concis.`

export async function POST(request) {
  try {
    const { messages } = await request.json()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    })

    return Response.json({ 
      message: response.content[0].text 
    })

  } catch (error) {
    console.error('Error:', error)
    return Response.json({ 
      message: 'Désolé, une erreur est survenue. Veuillez réessayer.' 
    }, { status: 500 })
  }
}
