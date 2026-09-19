/**
 * Utilitário de telemetria e eventos para Google Analytics 4 (GA4)
 * Respeita privacidade e não envia dados pessoais sensíveis
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type GAEventName =
  | 'search_profile'
  | 'view_profile'
  | 'view_post'
  | 'ranking_filter'
  | 'click_threads'
  | 'refresh_profile';

export function trackEvent(eventName: GAEventName, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString(),
    });
  }
}
