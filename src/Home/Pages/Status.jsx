import React, { useEffect, useState } from 'react';

// Working, backend-ready Status component.
const Status = ({ endpoint = '/api/status', initialData }) => {
    const [data, setData] = useState(
        initialData || {
            totalWorks: 3,
            completedWorks: 1,
            averageRating: 4.2,
            followers: 1250,
        }
    );
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!endpoint) return; // allow disabling fetch in dev
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
                if (!res.ok) throw new Error('Failed to load status');
                const json = await res.json();
                if (!cancelled && json) {
                    setData((prev) => ({
                        totalWorks: json.totalWorks ?? prev.totalWorks,
                        completedWorks: json.completedWorks ?? prev.completedWorks,
                        averageRating: json.averageRating ?? prev.averageRating,
                        followers: json.followers ?? prev.followers,
                    }));
                }
            } catch (e) {
                if (!cancelled) setError(e.message);
            }
        })();
        return () => { cancelled = true; };
    }, [endpoint]);

    return (
        <section className="stats-section">
            <div className="stat-card">
                <div className="icon">💼</div>
                <h3>{data.totalWorks}</h3>
                <p>Total Works</p>
            </div>
            <div className="stat-card">
                <div className="icon">✅</div>
                <h3>{data.completedWorks}</h3>
                <p>Completed Works</p>
            </div>
            <div className="stat-card">
                <div className="icon">⭐</div>
                <h3>{data.averageRating}</h3>
                <p>Average Rating</p>
            </div>
            <div className="stat-card">
                <div className="icon">👥</div>
                <h3>{data.followers}</h3>
                <p>Followers</p>
            </div>
            {error && (
                <div className="status-error" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#b00' }}>
                    {error}
                </div>
            )}
        </section>
    );
};

export default Status;