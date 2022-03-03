import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut } from 'firebase/auth';
import Clock from 'react-live-clock';

const Home = () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const [user, setUser] = useState(null);

  const googleSignIn = () => signInWithRedirect(auth, provider);
  
  const handleSignOut = () => signOut(auth).then(() => {
    console.log("Successfully signed out");
  }).catch(error => {
    console.error("Error signing out: " + error);
  });

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      setUser(user);
    })
  }, []);

  return (!user ? 
    (<div>
        <button onClick={googleSignIn}>Login</button>
    </div>)

    :

    (
    <div>
      <Clock format={'h:mm A'} ticking={true} />
      <h3>Welcome back, {user.displayName}</h3>
      <button onClick={handleSignOut}>Sign Out</button>

      <div>WeatherBox</div>

      <div>
        Icons + Text = links to other pages
      </div>
    </div>)
  );
}

export default Home;


/*
  import { getAuth, onAuthStateChanged } from "firebase/auth";

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
*/

/*
    const auth = getAuth();
    signOut(auth).then(() => {
    // Sign-out successful.
    }).catch((error) => {
    // An error happened.
    });
*/