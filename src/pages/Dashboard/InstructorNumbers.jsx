// SchoolNumbers.jsx — now a data-fetching hook instead
import { useEffect, useState } from "react";
import axios from "axios";

export const useInstructoreCount = () => {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem('access') ||
      sessionStorage.getItem('access');

    axios.get("http://127.0.0.1:8000/api/users/", {
      headers: { Authorization: `Bearer ${token}` },
      params: { role: 'I' }          // ← adds ?role=I to the URL
    })
      .then(res => setCount(res.data.count))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { count, loading, error };
};
export default useInstructoreCount;