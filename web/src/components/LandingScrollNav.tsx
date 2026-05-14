import React, { useEffect, useMemo, useState } from 'react';
import styles from './LandingScrollNav.module.css';

type Section = {
  id: string;
  label: string;
};

type LandingScrollNavProps = {
  sections: Section[];
};

const LandingScrollNav: React.FC<LandingScrollNavProps> = ({ sections }) => {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));

    if (nodes.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = visible[0]?.target as HTMLElement | undefined;
        if (top?.id) setActiveId(top.id);
      },
      { root: null, threshold: [0.15, 0.25, 0.4, 0.6], rootMargin: '-15% 0px -70% 0px' }
    );

    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [sectionIds]);

  return (
    <div className={styles.wrap} role="navigation" aria-label="Landing sections">
      <div className={styles.inner}>
        <div className={styles.pills}>
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.pill} ${activeId === s.id ? styles.pillActive : ''}`}
              onClick={() => {
                const el = document.getElementById(s.id);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className={styles.hint}>
          <span className={styles.dot} aria-hidden="true" />
          <span>Scroll to explore</span>
        </div>
      </div>
    </div>
  );
};

export default LandingScrollNav;

