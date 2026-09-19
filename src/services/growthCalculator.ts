import { PostMetricSnapshot, PostGrowthCalculation } from '@/domain/posts/types';

/**
 * Fórmula de Cálculo de Crescimento de Engajamento:
 *
 * 1. Diferença absoluta de likes:
 *    ΔLikes = Likes(Snapshot_Atual) - Likes(Snapshot_Anterior)
 *
 * 2. Intervalo de tempo em horas:
 *    ΔHoras = (Timestamp_Atual - Timestamp_Anterior) em milissegundos / 3.600.000
 *
 * 3. Velocidade de crescimento (Likes por hora):
 *    Velocidade = ΔLikes / Max(ΔHoras, 0.01)
 *
 * @param currentSnapshot Snapshot mais recente
 * @param previousSnapshot Snapshot anterior
 * @returns Cálculo de crescimento consolidado
 */
export function calculatePostGrowth(
  currentSnapshot: PostMetricSnapshot,
  previousSnapshot: PostMetricSnapshot
): PostGrowthCalculation {
  const currentLikes = currentSnapshot.likeCount;
  const previousLikes = previousSnapshot.likeCount;
  const absoluteGrowth = Math.max(0, currentLikes - previousLikes);

  const diffMs = currentSnapshot.capturedAt.getTime() - previousSnapshot.capturedAt.getTime();
  const hoursElapsed = Math.max(0.01, diffMs / (1000 * 60 * 60));

  const likesPerHour = Math.round((absoluteGrowth / hoursElapsed) * 100) / 100;

  return {
    postId: currentSnapshot.postId,
    currentLikes,
    previousLikes,
    absoluteGrowth,
    hoursElapsed: Math.round(hoursElapsed * 100) / 100,
    likesPerHour,
  };
}
