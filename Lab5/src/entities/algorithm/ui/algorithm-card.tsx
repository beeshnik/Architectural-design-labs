import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib';
import type { AlgorithmResponse } from '@/shared/api';

interface AlgorithmCardProps {
  algorithm: AlgorithmResponse;
  onClick?: () => void;
  isActive?: boolean;
}

export function AlgorithmCard({ algorithm, onClick, isActive }: AlgorithmCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{algorithm.name}</CardTitle>
        <CardDescription>
          Создан: {formatDateTime(algorithm.created_at)}
        </CardDescription>
      </CardHeader>
      {algorithm.body && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {algorithm.body}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
