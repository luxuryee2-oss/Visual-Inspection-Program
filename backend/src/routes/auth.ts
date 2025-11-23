import {Router} from 'express';
import bcrypt from 'bcrypt';
import {logger} from '../utils/logger.js';
import {prisma} from '../lib/prisma.js';

export function createAuthRouter(): Router {
  const router = Router();

  // 로그인
  router.post('/login', async (req, res, next) => {
    try {
      const {username, password} = req.body;

      if (!username || !password) {
        return res.status(400).json({message: '사용자명과 비밀번호를 입력하세요.'});
      }

      const user = await prisma.user.findUnique({
        where: {username}
      });

      if (!user) {
        return res.status(401).json({message: '사용자명 또는 비밀번호가 올바르지 않습니다.'});
      }

      // 비밀번호 확인 (bcrypt)
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({message: '사용자명 또는 비밀번호가 올바르지 않습니다.'});
      }

      // 간단한 세션 토큰 (실제로는 JWT 사용 권장)
      const token = Buffer.from(`${user.id}:${user.username}`).toString('base64');

      logger.info({username, userId: user.id}, '로그인 성공');

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      logger.error({error}, '로그인 실패');
      next(error);
    }
  });

  // 현재 사용자 정보 조회
  router.get('/me', async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: '인증이 필요합니다.'});
      }

      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, username] = decoded.split(':');

      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          username
        }
      });

      if (!user) {
        return res.status(401).json({message: '인증이 유효하지 않습니다.'});
      }

      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      logger.error({error}, '사용자 정보 조회 실패');
      next(error);
    }
  });

  // 사용자 등록
  router.post('/register', async (req, res, next) => {
    try {
      logger.info({body: req.body}, '회원가입 요청 받음');
      const {username, name, password, role = 'inspector'} = req.body;

      if (!username || !name || !password) {
        logger.warn({username, name, hasPassword: !!password}, '필수 필드 누락');
        return res.status(400).json({message: '사용자명, 이름, 비밀번호는 필수입니다.'});
      }

      if (password.length < 6) {
        return res.status(400).json({message: '비밀번호는 최소 6자 이상이어야 합니다.'});
      }

      // 중복 사용자명 확인
      const existingUser = await prisma.user.findUnique({
        where: {username}
      });

      if (existingUser) {
        logger.warn({username}, '이미 존재하는 사용자명');
        return res.status(409).json({message: '이미 존재하는 사용자명입니다.'});
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(password, 10);

      // 사용자 생성
      const user = await prisma.user.create({
        data: {
          username,
          name,
          password: hashedPassword,
          role: role === 'admin' ? 'admin' : 'inspector'
        }
      });

      logger.info({username, userId: user.id, name}, '사용자 등록 완료');

      return res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      logger.error({error, stack: (error as Error).stack}, '사용자 등록 실패');
      next(error);
    }
  });

  return router;
}
