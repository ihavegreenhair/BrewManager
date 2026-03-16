import { Package } from 'lucide-react';

export const Inventory = () => {
  const grains = [{ id: 1, name: '2-Row', amount: 55, unit: 'lbs' }];
  const hops = [{ id: 1, name: 'Citra', amount: 16, unit: 'oz' }];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Package size={28} color="var(--accent-primary)" />
        <h2>Inventory Management</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Grains */}
        <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Grains & Extract</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {grains.map(g => (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                <span>{g.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{g.amount} {g.unit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Hops */}
        <section style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Hops</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {hops.map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                <span>{h.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{h.amount} {h.unit}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
