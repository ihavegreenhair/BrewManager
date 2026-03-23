export const Inventory = () => {
  const grains = [{ id: 1, name: '2-Row', amount: 55, unit: 'lbs' }];
  const hops = [{ id: 1, name: 'Citra', amount: 16, unit: 'oz' }];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>Inventory Management</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', '@media (minWidth: 768px)': { gridTemplateColumns: '1fr 1fr', gap: '2rem' } } as any}>
        {/* Grains */}
        <section style={{ background: 'linear-gradient(180deg, var(--bg-surface-hover) 0%, var(--bg-surface) 100%)', padding: '2rem', borderRadius: '0', borderLeft: '2px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Grains & Extract</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {grains.map(g => (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-inset)', borderRadius: '0', border: '1px solid var(--border-color)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{g.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{g.amount} {g.unit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Hops */}
        <section style={{ background: 'linear-gradient(180deg, var(--bg-surface-hover) 0%, var(--bg-surface) 100%)', padding: '2rem', borderRadius: '0', borderLeft: '2px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Hops</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {hops.map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-inset)', borderRadius: '0', border: '1px solid var(--border-color)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{h.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--status-success)' }}>{h.amount} {h.unit}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
