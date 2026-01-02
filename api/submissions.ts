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
      const { studentId, courseId, status } = req.query;

      let query = 'SELECT * FROM exam_submissions WHERE 1=1';
      const params: any[] = [];

      if (studentId) {
        params.push(studentId);
        query += ` AND student_id = $${params.length}`;
      }
      if (courseId) {
        params.push(courseId);
        query += ` AND course_id = $${params.length}`;
      }
      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }

      query += ' ORDER BY submitted_at DESC';

      const result = await sql.query(query, params);
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      // Submeter prova
      const { examId, studentId, lessonId, courseId, answers } = req.body;

      if (!examId || !studentId || !lessonId || !courseId || !answers) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      // Criar submissão
      const result = await sql`
        INSERT INTO exam_submissions (exam_id, student_id, lesson_id, course_id, status)
        VALUES (${examId}, ${studentId}, ${lessonId}, ${courseId}, 'pending')
        RETURNING *
      `;
      const submissionId = result.rows[0].id;

      // Salvar respostas
      for (const answer of answers) {
        await sql`
          INSERT INTO student_answers (submission_id, question_id, selected_answer)
          VALUES (${submissionId}, ${answer.questionId}, ${answer.selectedAnswer})
        `;
      }

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      // Aprovar ou reprovar submissão
      const { submissionId, status, reviewedBy } = req.body;

      if (!submissionId || !status || !reviewedBy) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      // Atualizar submissão
      const result = await sql`
        UPDATE exam_submissions
        SET status = ${status}, reviewed_at = NOW(), reviewed_by = ${reviewedBy}
        WHERE id = ${submissionId}
        RETURNING *
      `;

      if (status === 'approved') {
        // Atualizar progresso
        const submission = result.rows[0];
        
        // Marcar aula como completa
        await sql`
          UPDATE lesson_progress
          SET status = 'completed', completed_at = NOW()
          WHERE lesson_id = ${submission.lesson_id} AND student_id = ${submission.student_id}
        `;

        // Desbloquear próxima aula
        const currentLesson = await sql`
          SELECT lesson_order FROM lessons WHERE id = ${submission.lesson_id}
        `;
        
        const nextLesson = await sql`
          SELECT l.id
          FROM lessons l
          WHERE l.course_id = ${submission.course_id} 
            AND l.lesson_order = ${currentLesson.rows[0].lesson_order + 1}
        `;

        if (nextLesson.rows.length > 0) {
          await sql`
            UPDATE lesson_progress
            SET status = 'available'
            WHERE lesson_id = ${nextLesson.rows[0].id} AND student_id = ${submission.student_id}
          `;
        }
      }

      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Erro na API de submissions:', error);
    return res.status(500).json({ error: error.message });
  }
}
