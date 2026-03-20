import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, senha, sistema } = req.body;

  if (!email || !senha || !sistema) {
    res.status(400).json({ message: 'Email, senha e sistema sao obrigatorios' });
    return;
  }

  const { data: sistemaAtivo, error: sistemaError } = await supabase
    .from('sistemas')
    .select('codigo, nome')
    .eq('codigo', sistema)
    .eq('ativo', true)
    .single();

  if (sistemaError || !sistemaAtivo) {
    res.status(400).json({ message: 'Sistema invalido ou inativo' });
    return;
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('ativo', true)
    .single();

  if (error || !usuario) {
    res.status(401).json({ message: 'Credenciais invalidas' });
    return;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    res.status(401).json({ message: 'Credenciais invalidas' });
    return;
  }

  const token = jwt.sign(
    { userId: usuario.id, email: usuario.email, sistema: sistemaAtivo.codigo },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    },
    sistema: sistemaAtivo
  });
};

export const registrar = async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ message: 'Nome, email e senha sao obrigatorios' });
    return;
  }

  const { data: existente } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .single();

  if (existente) {
    res.status(409).json({ message: 'Email ja cadastrado' });
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const { data: novoUsuario, error } = await supabase
    .from('usuarios')
    .insert({ nome, email, senha_hash: senhaHash, ativo: true })
    .select('id, nome, email')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar usuario', error: error.message });
    return;
  }

  res.status(201).json({ usuario: novoUsuario });
};

export const perfil = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, ativo, created_at')
    .eq('id', req.userId!)
    .single();

  if (error || !usuario) {
    res.status(404).json({ message: 'Usuario nao encontrado' });
    return;
  }

  res.json({ usuario });
};
