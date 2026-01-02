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
      // Listar todos os cursos ou cursos de um professor específico
      const { professorId, studentId } = req.query;

      if (studentId) {
        // Cursos em que o aluno está matriculado
        const result = await sql`
          SELECT c.*, u.name as professor_name
          FROM courses c
          JOIN users u ON c.professor_id = u.id
          JOIN enrollments e ON c.id = e.course_id
          WHERE e.student_id = ${studentId as string}
          ORDER BY c.created_at DESC
        `;
        return res.status(200).json(result.rows);
      }

      if (professorId) {
        const result = await sql`
          SELECT * FROM courses 
          WHERE professor_id = ${professorId as string}
          ORDER BY created_at DESC
        `;
        return res.status(200).json(result.rows);
      }

      // Todos os cursos
      const result = await sql`
        SELECT c.*, u.name as professor_name
        FROM courses c
        JOIN users u ON c.professor_id = u.id
        ORDER BY c.created_at DESC
      `;
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      // Criar novo curso
      const { title, description, professorId } = req.body;

      if (!title || !professorId) {
        return res.status(400).json({ error: 'Título e professor são obrigatórios' });
      }

      const result = await sql`
        INSERT INTO courses (title, description, professor_id)
        VALUES (${title}, ${description || ''}, ${professorId})
        RETURNING *
      `;

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Erro na API de courses:', error);
    return res.status(500).json({ error: error.message });
  }
}
