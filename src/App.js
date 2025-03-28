import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Grid,
  Divider,
  Container,
  CircularProgress,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Avatar,
  Stack
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

const domain = "dev-5r6yq7i74ultdb48.us.auth0.com";
const clientId = "JJm9u7L96S106jaxJ2iLM4xPTv6TkLV3";

function AppWrapper() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <App />
    </Auth0Provider>
  );
}

function App() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <Router>
      <AppBar position="static" sx={{ backgroundColor: '#2e7d32' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuBookIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BookHive
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/books">Books</Button>
          <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
          <Button color="inherit" component={Link} to="/profile">Profile</Button>
          {isAuthenticated ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar alt={user.name} src={user.picture} sx={{ width: 32, height: 32 }} />
              <Button color="inherit" onClick={() => logout({ returnTo: window.location.origin })}>
                Logout
              </Button>
            </Stack>
          ) : (
            <Button color="inherit" onClick={() => loginWithRedirect()}>Login</Button>
          )}
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/books" element={<Books />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

function Welcome() {
  return (
    <Box sx={{ backgroundColor: '#e8f5e9', minHeight: '100vh', py: 10 }}>
      <Container maxWidth="md">
        <Typography variant="h3" gutterBottom fontWeight="bold" textAlign="center">
          📚 Welcome to BookHive
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary">
          Discover, read, and manage your favorite books with ease. Built for readers and learners.
        </Typography>
      </Container>
    </Box>
  );
}

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', id: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const { isAuthenticated } = useAuth0();

  const fetchBooks = () => {
    axios.get('http://127.0.0.1:8000/api/books/')
      .then(res => setBooks(res.data))
      .catch(err => console.error('Books error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSaveBook = () => {
    const request = formData.id
      ? axios.put(`http://127.0.0.1:8000/api/books/${formData.id}/`, formData)
      : axios.post('http://127.0.0.1:8000/api/books/', formData);

    request
      .then(() => {
        setOpen(false);
        setFormData({ title: '', author: '', id: null });
        fetchBooks();
        setSnack({ open: true, message: 'Book saved successfully', severity: 'success' });
      })
      .catch(() => setSnack({ open: true, message: 'Error saving book', severity: 'error' }));
  };

  const handleDelete = (id) => {
    if (!isAuthenticated) return;
    axios.delete(`http://127.0.0.1:8000/api/books/${id}/`)
      .then(() => {
        fetchBooks();
        setSnack({ open: true, message: 'Book deleted', severity: 'info' });
      })
      .catch(() => setSnack({ open: true, message: 'Error deleting book', severity: 'error' }));
  };

  const handleEdit = (book) => {
    setFormData(book);
    setOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Books Library</Typography>
      <Divider sx={{ mb: 3 }} />
      {isAuthenticated && (
        <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ mb: 3 }}>
          ➕ Add Book
        </Button>
      )}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {books.map(book => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">{book.title}</Typography>
                <Typography variant="body2" color="text.secondary">by {book.author}</Typography>
                {isAuthenticated && (
                  <Box mt={2} display="flex" gap={1}>
                    <Button size="small" variant="outlined" color="primary" onClick={() => handleEdit(book)}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(book.id)}>Delete</Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{formData.id ? 'Edit Book' : 'Add New Book'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="author"
            label="Author"
            fullWidth
            value={formData.author}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveBook}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

function Dashboard() {
  const [pdfs, setPdfs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/s3-pdfs/'),
      axios.get('http://127.0.0.1:8000/api/recommend/1/')
    ]).then(([pdfRes, recRes]) => {
      setPdfs(pdfRes.data);
      setRecommendations(recRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>📊 Dashboard</Typography>
      <Section title="Public PDFs">
        <Grid container spacing={3}>
          {pdfs.map((pdf, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper sx={{ p: 2 }}>
                <Typography>{pdf.name}</Typography>
                <Button href={pdf.url} target="_blank" fullWidth sx={{ mt: 1 }} variant="contained" color="primary">
                  Download ⬇️
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>
      <Section title="Recommended Books">
        <Grid container spacing={3}>
          {recommendations.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Paper elevation={4} sx={{ p: 2, borderLeft: '4px solid #2e7d32' }}>
                <Typography variant="h6">{book.title}</Typography>
                <Typography variant="body2">by {book.author}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>
    </Container>
  );
}

function Profile() {
  const { user, isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <Container sx={{ py: 10 }}><Typography variant="h5">Please login to view your profile.</Typography></Container>;
  }
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Stack spacing={2} alignItems="center">
          <Avatar src={user.picture} sx={{ width: 80, height: 80 }} />
          <Typography variant="h5">{user.name}</Typography>
          <Typography variant="body2">{user.email}</Typography>
        </Stack>
      </Paper>
    </Container>
  );
}

function Section({ title, children }) {
  return (
    <Box my={5}>
      <Typography variant="h5" fontWeight="medium" gutterBottom>{title}</Typography>
      <Divider sx={{ mb: 3 }} />
      {children}
    </Box>
  );
}

export default AppWrapper;