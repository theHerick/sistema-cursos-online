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
      // Buscar prova e questões
      const { examId, lessonId } = req.query;

      if (examId) {
        const exam = await sql`SELECT * FROM exams WHERE id = ${examId as string}`;
        const questions = await sql`
          SELECT * FROM questions 
          WHERE exam_id = ${examId as string}
          ORDER BY question_order ASC
        `;

        if (exam.rows.length === 0) {
          return res.status(404).json({ error: 'Prova não encontrada' });
        }

        return res.status(200).json({
          ...exam.rows[0],
          questions: questions.rows.map(q => ({
            id: q.id,
            text: q.question_text,
            options: [q.option_1, q.option_2, q.option_3, q.option_4],
            correctAnswer: q.correct_answer
          }))
        });
      }

      if (lessonId) {
        const exam = await sql`SELECT * FROM exams WHERE lesson_id = ${lessonId as string}`;
        if (exam.rows.length === 0) {
          return res.status(404).json({ error: 'Prova não encontrada' });
        }
        return res.status(200).json(exam.rows[0]);
      }

      return res.status(400).json({ error: 'examId ou lessonId é obrigatório' });
    }

    if (req.method === 'POST') {
      // Criar prova com questões
      const { lessonId, questions } = req.body;

      if (!lessonId || !questions || questions.length === 0) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      // Criar prova
      const examResult = await sql`
        INSERT INTO exams (lesson_id)
        VALUES (${lessonId})
        RETURNING *
      `;
      const examId = examResult.rows[0].id;

      // Inserir questões
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await sql`
          INSERT INTO questions (
            exam_id, question_text, 
            option_1, option_2, option_3, option_4,
            correct_answer, question_order
          )
          VALUES (
            ${examId}, ${q.text},
            ${q.options[0]}, ${q.options[1]}, ${q.options[2]}, ${q.options[3]},
            ${q.correctAnswer}, ${i}
          )
        `;
      }

      return res.status(201).json(examResult.rows[0]);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Erro na API de exams:', error);
    return res.status(500).json({ error: error.message });
  }
}
