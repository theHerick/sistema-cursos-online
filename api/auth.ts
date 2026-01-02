import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Login ou criar usuário
      const { name, role } = req.body;

      if (!name || !role) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }

      const email = `${name.toLowerCase().replace(/\s+/g, '')}@${role}.com`;

      // Verificar se usuário já existe
      const existingUser = await sql`
        SELECT * FROM users WHERE name = ${name} AND role = ${role}
      `;

      if (existingUser.rows.length > 0) {
        return res.status(200).json(existingUser.rows[0]);
      }

      // Criar novo usuário
      const result = await sql`
        INSERT INTO users (name, email, role)
        VALUES (${name}, ${email}, ${role})
        RETURNING *
      `;

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'GET') {
      // Listar todos os usuários ou filtrar por role
      const { role } = req.query;

      let result;
      if (role) {
        result = await sql`SELECT * FROM users WHERE role = ${role as string}`;
      } else {
        result = await sql`SELECT * FROM users`;
      }

      return res.status(200).json(result.rows);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Erro na API de auth:', error);
    return res.status(500).json({ error: error.message });
  }
}
