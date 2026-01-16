import { useEffect, useRef } from 'react';

const ENABLE_PERF_LOGS = false;

export const usePerformanceMonitor = (componentName) => {
  const mountTime = useRef(null);
  const renderCount = useRef(0);

  useEffect(() => {
    mountTime.current = performance.now();
    renderCount.current += 1;
    if (ENABLE_PERF_LOGS) console.log(`${componentName} mounted in ${mountTime.current.toFixed(2)}ms`);

    return () => {
      if (ENABLE_PERF_LOGS && mountTime.current) {
        console.log(`${componentName} unmounted after ${(performance.now() - mountTime.current).toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        if (ENABLE_PERF_LOGS) console.log(`LCP:`, list.getEntries().pop()?.startTime);
      });
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(e => {
          if (ENABLE_PERF_LOGS) console.log(`FID:`, e.processingStart - e.startTime);
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      return () => { lcpObserver.disconnect(); fidObserver.disconnect(); };
    } catch { /* unsupported */ }
  }, [componentName]);
};

export const measureAsync = async (name, asyncFn) => {
  const start = performance.now();
  try {
    const result = await asyncFn();
    if (ENABLE_PERF_LOGS) console.log(`${name} took ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    if (ENABLE_PERF_LOGS) console.error(`${name} failed after ${(performance.now() - start).toFixed(2)}ms`);
    throw error;
  }
};

export const logNavigation = (to) => {
  if (ENABLE_PERF_LOGS) console.log(`Navigation: -> ${to}`);
};
