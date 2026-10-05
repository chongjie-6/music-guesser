import { useEffect, useState } from "react";

export default function Countdown({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  return <>{Math.max(0, Math.ceil((deadline - now) / 1000))}</>;
}
