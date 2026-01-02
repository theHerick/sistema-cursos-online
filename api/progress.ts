import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { studentId, courseId } = req.query;

      if (!studentId || !courseId) {
        return res.status(400).json({ error: 'studentId e courseId são obrigatórios' });
      }

      const result = await sql`
        SELECT lp.*, l.title, l.lesson_order
        FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        WHERE lp.student_id = ${studentId as string} 
          AND lp.course_id = ${courseId as string}
        ORDER BY l.lesson_order ASC
      `;

      return res.status(200).json(result.rows);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Erro na API de progress:', error);
    return res.status(500).json({ error: error.message });
  }
}
