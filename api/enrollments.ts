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
      const { courseId, studentId } = req.query;

      if (courseId) {
        // Listar alunos matriculados em um curso
        const result = await sql`
          SELECT u.*, e.enrolled_at
          FROM users u
          JOIN enrollments e ON u.id = e.student_id
          WHERE e.course_id = ${courseId as string} AND u.role = 'aluno'
          ORDER BY e.enrolled_at DESC
        `;
        return res.status(200).json(result.rows);
      }

      if (studentId) {
        // Listar cursos de um aluno
        const result = await sql`
          SELECT c.*, e.enrolled_at
          FROM courses c
          JOIN enrollments e ON c.id = e.course_id
          WHERE e.student_id = ${studentId as string}
          ORDER BY e.enrolled_at DESC
        `;
        return res.status(200).json(result.rows);
      }

      // Listar todas as matrículas
      const result = await sql`SELECT * FROM enrollments ORDER BY enrolled_at DESC`;
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      // Matricular aluno em um curso
      const { courseId, studentId, enrolledBy } = req.body;

      if (!courseId || !studentId) {
        return res.status(400).json({ error: 'courseId e studentId são obrigatórios' });
      }

      // Verificar se já está matriculado
      const existing = await sql`
        SELECT * FROM enrollments 
        WHERE course_id = ${courseId} AND student_id = ${studentId}
      `;

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Aluno já matriculado neste curso' });
      }

      // Criar matrícula
      const result = await sql`
        INSERT INTO enrollments (course_id, student_id, enrolled_by)
        VALUES (${courseId}, ${studentId}, ${enrolledBy || null})
        RETURNING *
      `;

      // Criar progresso inicial - primeira aula disponível
      const lessons = await sql`
        SELECT * FROM lessons 
        WHERE course_id = ${courseId}
        ORDER BY lesson_order ASC
      `;

      for (let i = 0; i < lessons.rows.length; i++) {
        const lesson = lessons.rows[i];
        await sql`
          INSERT INTO lesson_progress (lesson_id, course_id, student_id, status)
          VALUES (
            ${lesson.id}, 
            ${courseId}, 
            ${studentId}, 
            ${i === 0 ? 'available' : 'locked'}
          )
        `;
      }

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Erro na API de enrollments:', error);
    return res.status(500).json({ error: error.message });
  }
}
