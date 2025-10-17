import { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Link,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Indian Government Theme */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          minHeight: '100vh',
          '@media (max-width: 960px)': {
            display: 'none',
          },
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: 300,
          }}
        >
          {/* Ashoka Chakra Symbol */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '40px',
              fontWeight: 'bold',
            }}
          >
            ☸
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: '#1e40af',
              fontWeight: 'bold',
              marginBottom: 1,
              fontSize: '18px',
            }}
          >
            भारत सरकार
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#1e40af',
              marginBottom: 2,
              fontSize: '14px',
            }}
          >
            Government of India
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#333',
              lineHeight: 1.6,
              fontSize: '13px',
              marginBottom: 2,
            }}
          >
            आपकी सेवा में समर्पित
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#555',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            यह पोर्टल भारत सरकार द्वारा सुरक्षित और विश्वसनीय सेवाएं प्रदान करता है। आपकी व्यक्तिगत जानकारी सुरक्षित है।
          </Typography>

          <Box sx={{ marginTop: 3, paddingTop: 2, borderTop: '2px solid #1e40af' }}>
            <Typography
              variant="caption"
              sx={{
                color: '#138808',
                fontWeight: 'bold',
                fontSize: '11px',
              }}
            >
              Made in India
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          backgroundColor: '#f5f5f5',
          '@media (max-width: 960px)': {
            flex: 1,
          },
        }}
      >
        <Paper
          elevation={2}
          sx={{
            padding: 3,
            borderRadius: 1,
            width: '100%',
            maxWidth: 400,
            borderTop: '4px solid #1e40af',
          }}
        >
          {/* Header */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: '#1e40af',
                marginBottom: 0.5,
              }}
            >
              Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Access your government portal
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              variant="outlined"
              disabled={loading}
              size="small"
              InputProps={{
                startAdornment: (
                  <Mail size={18} style={{ marginRight: 8, color: '#1e40af' }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1e40af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e40af',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1e40af',
                },
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              variant="outlined"
              disabled={loading}
              size="small"
              InputProps={{
                startAdornment: (
                  <Lock size={18} style={{ marginRight: 8, color: '#1e40af' }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1e40af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e40af',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1e40af',
                },
              }}
            />

            {/* Remember Me & Forgot Password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    size="small"
                    sx={{
                      '&.Mui-checked': {
                        color: '#1e40af',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '13px' }}>Remember me</Typography>
                }
              />
              <Link
                href="#"
                underline="hover"
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#1e40af',
                  '&:hover': { color: '#138808' },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                marginTop: 1,
                background: '#1e40af',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                padding: '8px',
                '&:hover': {
                  background: '#1a3a8a',
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} color="inherit" />
                  Logging in...
                </Box>
              ) : (
                'Login'
              )}
            </Button>
          </Box>

          {/* Sign Up Link */}
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              display: 'block',
              marginTop: 2,
              color: '#666',
              fontSize: '12px',
            }}
          >
            Don't have an account?{' '}
            <Link
              href="#"
              underline="hover"
              sx={{
                fontWeight: 600,
                color: '#1e40af',
                '&:hover': { color: '#138808' },
              }}
            >
              Register here
            </Link>
          </Typography>

          {/* Security Message */}
          <Box
            sx={{
              marginTop: 2,
              paddingTop: 2,
              borderTop: '1px solid #ddd',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '11px',
                display: 'block',
              }}
            >
              🔒 Your data is secure and encrypted
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}