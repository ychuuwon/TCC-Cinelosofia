import { useEffect, useState } from 'react';

export default function ImageCarousel({ images = [], slot = null, interval = 3500, className = '' }) {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState(images || []);

  useEffect(() => {
    let mounted = true;
    const fetchSlot = async () => {
      if (!slot) return;
      try {
        const token = localStorage.getItem('token');
        const url = `http://localhost:7777/api/carousel${slot ? `?slot=${slot}` : ''}`;
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setItems(data.map((d) => d.url));
        }
      } catch (err) {
        // ignore
      }
    };

    fetchSlot();

    return () => { mounted = false; };
  }, [slot]);

  useEffect(() => {
    const list = images && images.length ? images : items;
    if (!list || list.length === 0) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, interval);
    return () => clearInterval(id);
  }, [images, items, interval]);

  const listFromServer = images && images.length ? images : items;

  // Fallback default images when no images provided from server
  const defaultHome = [
    process.env.PUBLIC_URL + '/imagens/encontro.png',
    process.env.PUBLIC_URL + '/imagens/jojo.jpg',
    process.env.PUBLIC_URL + '/imagens/cheerleader.jpg',
  ];
  const defaultAuth = [
    process.env.PUBLIC_URL + '/imagens/poderoso.jpg',
    process.env.PUBLIC_URL + '/imagens/jojo.jpg',
    process.env.PUBLIC_URL + '/imagens/cheerleader.jpg',
  ];

  let list = listFromServer;
  if (!listFromServer || listFromServer.length === 0) {
    if (slot === 'home') list = defaultHome;
    else if (slot === 'auth' || slot === 'login' || slot === 'register') list = defaultAuth;
    else list = [];
  }

  if (!list || list.length === 0) return null;

  return (
    <div className={`carousel-container ${className}`}>
      {list.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt="carousel"
          className={`carousel-img ${i === index ? 'active' : ''}`}
          style={{ display: i === index ? 'block' : 'none' }}
        />
      ))}
    </div>
  );
}
