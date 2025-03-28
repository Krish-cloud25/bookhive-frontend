import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Container,
  CircularProgress,
  Paper
} from '@mui/material';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [booksRes, pdfsRes, recsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/books/'),
          axios.get('http://127.0.0.1:8000/api/s3-pdfs/'),
          axios.get('http://127.0.0.1:8000/api/recommend/1/')
        ]);
        setBooks(booksRes.data);
        setPdfs(pdfsRes.data);
        setRecommendations(recsRes.data);
      } catch (err) {
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom fontWeight="bold">
          📚 BookHive Dashboard
        </Typography>

        {/* All Books */}
        <Section title="All Books">
          <Grid container spacing={3}>
            {books.map(book => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <BookCard title={book.title} author={book.author} />
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Public PDFs */}
        <Section title="Public PDFs">
          <Grid container spacing={3}>
            {pdfs.map((pdf, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <PDFCard name={pdf.name} url={pdf.url} />
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Recommendations */}
        <Section title="Recommended For You">
          <Grid container spacing={3}>
            {recommendations.map(book => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <BookCard title={book.title} author={book.author} highlight />
              </Grid>
            ))}
          </Grid>
        </Section>
      </Container>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box my={5}>
      <Typography variant="h5" fontWeight="medium" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {children}
    </Box>
  );
}

function BookCard({ title, author, highlight }) {
  return (
    <Paper elevation={highlight ? 4 : 1} sx={{ p: 2, borderLeft: highlight ? '6px solid #2e7d32' : 'none' }}>
      <Typography variant="h6" fontWeight="medium">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        by {author}
      </Typography>
    </Paper>
  );
}

function PDFCard({ name, url }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body1" fontWeight="medium" gutterBottom>
          {name}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={url}
          target="_blank"
          fullWidth
        >
          Download ⬇️
        </Button>
      </CardContent>
    </Card>
  );
}
