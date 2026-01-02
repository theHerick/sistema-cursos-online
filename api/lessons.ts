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
      // Listar aulas de um curso
      const { courseId } = req.query;

      if (!courseId) {
        return res.status(400).json({ error: 'courseId é obrigatório' });
      }

      const lessons = await sql`
        SELECT l.*, e.id as exam_id
        FROM lessons l
        LEFT JOIN exams e ON l.id = e.lesson_id
        WHERE l.course_id = ${courseId as string}
        ORDER BY l.lesson_order ASC
      `;

      return res.status(200).json(lessons.rows);
    }

    if (req.method === 'POST') {
      // Adicionar nova aula
      const { courseId, title, externalLink } = req.body;

      if (!courseId || !title || !externalLink) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      // Pegar a próxima ordem
      const orderResult = await sql`
        SELECT COALESCE(MAX(lesson_order), -1) + 1 as next_order
        FROM lessons
        WHERE course_id = ${courseId}
      `;
      const nextOrder = orderResult.rows[0].next_order;

      const result = await sql`
        INSERT INTO lessons (course_id, title, external_link, lesson_order)
        VALUES (${courseId}, ${title}, ${externalLink}, ${nextOrder})
        RETURNING *
      `;

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Erro na API de lessons:', error);
    return res.status(500).json({ error: error.message });
  }
}
