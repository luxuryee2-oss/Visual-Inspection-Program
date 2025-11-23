import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {login, setAuthToken} from '@/api/auth';

type Props = {
  onLoginSuccess: () => void;
};

export function Login({onLoginSuccess}: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[hsl(var(--doom-red))]/30">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--doom-red))] text-2xl">로그인</CardTitle>
          <CardDescription>검사 작업자 로그인</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              variant="doom"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              기본 계정: inspector1 / password123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

