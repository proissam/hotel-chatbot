import './globals.css'

export const metadata = {
  title: 'Hotel Chatbot',
  description: 'Assistant de réservation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
