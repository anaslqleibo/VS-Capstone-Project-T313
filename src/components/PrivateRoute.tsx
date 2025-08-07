import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

function PrivateRoute({children}:React.PropsWithChildren) {
  const [user, setUser] = useState<User|undefined|null>(undefined); // undefined = still checking

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) return null; // Or a spinner while checking

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
