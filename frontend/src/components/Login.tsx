import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {login, register, setAuthToken} from '@/api/auth';

type Props = {
  onLoginSuccess: () => void;
};

export function Login({onLoginSuccess}: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(username, password);
      setAuthToken(response.token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      await register(username, name, password, 'inspector');
      // 회원가입 성공 후 자동 로그인
      const response = await login(username, password);
      setAuthToken(response.token);
      onLoginSuccess();
    } catch (err: any) {
      console.error('회원가입 에러:', err);
      let errorMessage = '회원가입에 실패했습니다.';
      
      if (err?.response) {
        // 서버 응답이 있는 경우
        errorMessage = err.response.data?.message ?? errorMessage;
      } else if (err?.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 오류)
        errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.';
      } else {
        // 요청 설정 중 오류
        errorMessage = err?.message ?? errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[hsl(var(--doom-red))]/30">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--doom-red))] text-2xl">
            {isRegister ? '회원가입' : '로그인'}
          </CardTitle>
          <CardDescription>
            {isRegister ? '새 계정을 만드세요' : '검사 작업자 로그인'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름 입력"
                  required
                  className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">사용자명</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용자명 입력"
                required
                className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                required
                className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
              />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 다시 입력"
                  required
                  className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              variant="doom"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? isRegister
                  ? '가입 중...'
                  : '로그인 중...'
                : isRegister
                  ? '회원가입'
                  : '로그인'}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                {isRegister ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
              </button>
            </div>
            {!isRegister && (
              <p className="text-xs text-center text-muted-foreground">
                기본 계정: inspector1 / password123
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

