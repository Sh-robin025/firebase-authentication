import firebase from "firebase/app";
import "firebase/auth";
import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import firebaseConfig from "./firebase/firebase.config";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


function App() {
  const [newUser, setNewUser] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState({
    create: false,
    name: '',
    email: '',
    password: '',
    photo: '',
  })
  console.log(user);

  const gProvider = new firebase.auth.GoogleAuthProvider();
  const handleGglSignIn = () => {
    firebase.auth()
      .signInWithPopup(gProvider)
      .then((result) => {
        const credential = result.credential;
        const token = credential.accessToken;
        const { displayName, email, photoURL } = result.user;
        setUser({ create: true, name: displayName, email: email, photo: photoURL });

      }).catch(error => {
        const errorCode = error.code;
        setError(error.message);
        const email = error.email;
        const credential = error.credential;
        console.log(errorCode);
      });
  }
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleFbSignIn = () => {
    firebase.auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        const credential = result.credential;
        console.log(credential);
        const { displayName, email, photoURL } = result.user;
        setUser({ create: true, name: displayName, email: email, photo: photoURL });
        console.log("success", result.user);
        const accessToken = credential.accessToken;
      })
      .catch((error) => {
        const errorCode = error.code;
        setError(error.message)
        const email = error.email;
        const credential = error.credential;
        console.log(errorCode, email, credential);
      });
    // console.log("facebook sign in");
  }
  const handleLogOut = () => {
    firebase.auth().signOut()
      .then(() => {
        setUser({ create: false });
      })
      .catch((error) => {
        setError(error)
      });
    // e.preventDefault()
  }
  const handleBlur = e => {
    const title = e.target.name;
    const typed = e.target.value;
    let dataValid;
    if (title === 'email') {
      dataValid = /\S+@\S+\.\S+/.test(typed);
      !dataValid && setError("Invalid Email");
    }
    if (title === 'name') {
      dataValid = true;
    }
    if (title === 'password') {
      dataValid = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(typed);
      !dataValid && setError("input valid password");
    }
    if (dataValid) {
      const userInfo = { ...user }
      userInfo[title] = typed;
      setUser(userInfo);
    }
  }
  const handleCreateUser = (e) => {
    if (newUser && user.email && user.name) {
      firebase.auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          const newUserInfo = { ...user }
          newUserInfo.create = true;
          setUser(newUserInfo);
          userInfoName(user.name)
        })
        .catch(error => {
          const errorCode = error.code;
          setError(error.message)
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
          const { displayName } = data.user;
          const newUserInfo = { ...user }
          newUserInfo.create = true;
          newUserInfo.name = displayName
          setUser(newUserInfo);
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          setError(errorMessage);
        });
    }
    e.preventDefault()
  }

  const userInfoName = name => {
    const user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name
    }).then(data => {

    }).catch(error => {
      console.log(error);
      setError(error)
    });
  }


  return (
    <Container className="mt-3 d-flex justify-content-between">
      <div className="bg-warning p-5"
        style={{ borderRadius: '15px' }}>
        <h2>Create User Authentication</h2>
        {
          user.create && <h5>{user.email} {newUser ? "created" : "loged in"} successfully.</h5>
        }
      </div>
      <Form style={{ width: '40%', marginLeft: 'auto', borderRadius: '10px' }}
        className="bg-info p-3">
        {
          user.create ?
            <div className="text-center">
              <h2>Welcome,{user.name}</h2>
              <img src={user.photo} style={{ borderRadius: '50%' }} alt="" /><br /><br />
              <Button
                onClick={handleLogOut}
                variant="primary"
                type="submit">
                Log out </Button>
            </div>
            : <div>
              {
                error && <h6 className="text-danger">* {error}</h6>
              }
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control name="email" placeholder="Enter email" required
                  onBlur={handleBlur} />
                <Form.Text className="text-muted">
                  * We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>
              {
                newUser && <Form.Group controlId="formBasicName">
                  <Form.Label>User name</Form.Label>
                  <Form.Control name="name" placeholder="Enter Username" required
                    onBlur={handleBlur} />
                </Form.Group>
              }

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" placeholder="Password" required
                  onBlur={handleBlur} />
              </Form.Group>
              <Form.Group controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="New User"
                  onChange={() => setNewUser(!newUser)} />
              </Form.Group>
              <div className="text-center">
                <Button
                  className="px-5"
                  onClick={handleCreateUser}
                  variant="primary"
                  type="submit">
                  {newUser ? "create" : "log in"}</Button><br /><br />
                <h6>log in with :-</h6>
              </div>
              <div className="d-flex justify-content-around">
                <p><Button onClick={handleGglSignIn}>Google</Button></p>
                <p> <Button onClick={handleFbSignIn}>Facebook</Button></p>
                <p> <Button onClick={handleFbSignIn}>Twitter</Button></p>
              </div>
            </div>
        }
      </Form>
    </Container>
  );
}

export default App;
