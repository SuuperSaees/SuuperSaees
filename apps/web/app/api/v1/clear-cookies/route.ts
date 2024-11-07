import { NextApiRequest, NextApiResponse } from 'next';

export default function POST(req: NextApiRequest, res: NextApiResponse) {
  // Get all cookies from the request
  const cookies = req.headers.cookie;

  if (cookies) {
    // Split cookies into an array
    const cookieArray = cookies.split(';');

    // Map each cookie to a Set-Cookie header with Max-Age=0 to delete it
    const clearCookies = cookieArray.map((cookie) => {
      const [name] = cookie.split('=');
      return `${name?.trim()}=; Max-Age=0; Path=/; HttpOnly`;
    });

    // Set the headers to clear all cookies
    res.setHeader('Set-Cookie', clearCookies);
  }

  // Respond with a success message
  res.status(200).json({ message: 'All cookies cleared' });
}
