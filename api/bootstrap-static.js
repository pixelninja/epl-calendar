export default async function handler(req, res) {
  // Set CORS headers to allow requests from your domain
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
    
    if (!response.ok) {
      throw new Error(`FPL API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Cache the response for 30 minutes (bootstrap data changes less frequently)
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate')
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching bootstrap-static:', error)
    res.status(500).json({ 
      error: 'Failed to fetch bootstrap-static data', 
      message: error.message 
    })
  }
}