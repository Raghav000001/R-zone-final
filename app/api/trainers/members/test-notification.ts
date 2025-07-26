import { NextApiRequest, NextApiResponse } from 'next';
import { createNotification } from './route';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log('Testing notification creation'); // Debug log
    try {
      await createNotification(
        'member_updated',
        'test_trainer_id',
        'Test Trainer',
        'test_member_id',
        'Test Member'
      );
      console.log('Test notification created successfully'); // Debug log
      res.status(200).json({ message: 'Test notification created successfully' });
    } catch (error) {
      console.error('Error in test notification creation:', error); // Debug log
      res.status(500).json({ error: 'Error in test notification creation' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 