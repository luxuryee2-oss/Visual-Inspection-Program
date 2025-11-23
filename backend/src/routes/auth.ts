import {Router} from 'express';
import {logger} from '../utils/logger.js';

// 간단한 인메모리 사용자 저장소 (실제로는 DB 사용 권장)
interface User {
  id: string;
  username: string;
  name: string;
  password: string; // 실제로는 해시된 비밀번호
  role: 'inspector' | 'admin';
}

const users = new Map<string, User>();

// 기본 사용자 추가 (개발용)
if (users.size === 0) {
  users.set('inspector1', {
    id: '1',
    username: 'inspector1',
    name: '검사자1',
    password: 'password123', // 실제로는 bcrypt로 해시
    role: 'inspector'
  });
}

export function createAuthRouter(): Router {
  const router = Router();

  // 로그인
  router.post('/login', async (req, res, next) => {
    try {
      const {username, password} = req.body;

      if (!username || !password) {
        return res.status(400).json({message: '사용자명과 비밀번호를 입력하세요.'});
      }

      const user = users.get(username);
      if (!user || user.password !== password) {
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

      const user = Array.from(users.values()).find((u) => u.id === userId && u.username === username);
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

  // 사용자 등록 (관리자용)
  router.post('/register', async (req, res, next) => {
    try {
      const {username, name, password, role = 'inspector'} = req.body;

      if (!username || !name || !password) {
        return res.status(400).json({message: '사용자명, 이름, 비밀번호는 필수입니다.'});
      }

      if (users.has(username)) {
        return res.status(409).json({message: '이미 존재하는 사용자명입니다.'});
      }

      const user: User = {
        id: String(users.size + 1),
        username,
        name,
        password, // 실제로는 bcrypt로 해시
        role: role === 'admin' ? 'admin' : 'inspector'
      };

      users.set(username, user);
      logger.info({username, userId: user.id}, '사용자 등록 완료');

      return res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      logger.error({error}, '사용자 등록 실패');
      next(error);
    }
  });

  return router;
}

