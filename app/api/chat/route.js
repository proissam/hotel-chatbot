import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Fonction pour chercher une réservation dans Airtable
async function searchReservation(name) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Reservations?filterByFormula=SEARCH(LOWER("${name}"),LOWER({Name}))`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    },
  });
  
  const data = await response.json();
  return data.records || [];
}

// Fonction pour créer une réservation
async function createReservation(details) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Reservations`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{
        fields: {
          Name: details.name,
          Email: details.email,
          CheckIn: details.checkIn,
          CheckOut: details.checkOut,
          RoomType: details.roomType,
          Status: 'Confirmed'
        }
      }]
    }),
  });
  
  const data = await response.json();
  return data;
}

export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    const systemPrompt = `Tu es l'assistant virtuel d'un hôtel de luxe. Tu dois:
    - Accueillir chaleureusement les clients
    - Aider à faire des réservations (demander: nom, email, dates d'arrivée/départ, type de chambre)
    - Répondre aux questions sur l'hôtel
    - Être poli et professionnel en français
    
    Types de chambres disponibles:
    - Standard (100€/nuit)
    - Deluxe (150€/nuit)  
    - Suite (250€/nuit)
    
    Services: spa, restaurant gastronomique, room service 24h, parking gratuit, wifi gratuit.
    
    Quand tu as toutes les infos pour une réservation, confirme les détails au client.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hotel-chatbot.vercel.app',
        'X-Title': 'Hotel Chatbot'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    const data = await response.json();
    
    return NextResponse.json({ 
      message: data.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
