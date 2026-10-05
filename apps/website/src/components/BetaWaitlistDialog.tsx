import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { WAITLIST } from '../content/site';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Close from '@mui/icons-material/Close';
import Person from '@mui/icons-material/Person';

interface BetaWaitlistDialogProps {
  open: boolean;
  onClose: () => void;
  /** Carried through from the pricing card so the copy can name the plan. */
  planName?: string;
}

type Status = 'editing' | 'confirmed';

/**
 * Intentionally generous on shape, strict on the parts that matter: exactly one
 * `@`, no whitespace, and a dot-separated TLD. Over-tight regexes reject valid
 * addresses, and a waitlist that turns away real signups is worse than one that
 * asks the backend to send a confirmation mail.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const validateEmail = (value: string): string | null => {
  if (!value.trim()) return 'Enter the email address for the invite.';
  if (!EMAIL_PATTERN.test(value.trim())) return 'That does not look like an email address.';
  return null;
};

export const BetaWaitlistDialog = ({
  open,
  onClose,
  planName,
}: BetaWaitlistDialogProps) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [device, setDevice] = useState(WAITLIST.devices[0]);
  const [status, setStatus] = useState<Status>('editing');

  /**
   * Every exit path goes through here so a stale error or confirmation is never
   * shown next time the dialog is opened. Resetting on close rather than in an
   * effect also avoids the extra render pass React flags for synchronous
   * setState inside an effect.
   */
  const handleClose = () => {
    setStatus('editing');
    setEmail('');
    setEmailError(null);
    setDevice(WAITLIST.devices[0]);
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateEmail(email);
    setEmailError(error);
    if (!error) setStatus('confirmed');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="waitlist-heading"
      slotProps={{
        paper: {
          sx: {
            backgroundColor: theme.palette.container,
            border: `1px solid ${theme.palette.divider}`,
          },
        },
      }}
    >
      {/* `component="div"` keeps MUI's DialogTitle from rendering its own h2:
          the only heading in the dialog is the one below, which is also the
          element the dialog is labelled by. Two elements shared the
          `waitlist-title` id, which left screen readers with a duplicated name. */}
      <DialogTitle component="div" sx={{ px: 3, pt: 3, pb: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              {WAITLIST.title}
            </Typography>
            <Typography id="waitlist-heading" variant="h3" component="h2">
              {planName ? `${planName} reserved` : WAITLIST.title}
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            aria-label="Close dialog"
            sx={{ minWidth: 0, px: 1, color: 'text.secondary' }}
          >
            <Close fontSize="small" />
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {status === 'confirmed' ? (
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 2 }}>
            <CheckCircle sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
            <Typography variant="body1">
              The address looks valid. This build has no backend, so nothing was sent or
              stored.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {WAITLIST.notWiredNotice}
            </Typography>
          </Stack>
        ) : (
          <Stack
            component="form"
            id="waitlist-form"
            spacing={2.5}
            onSubmit={handleSubmit}
            noValidate
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {WAITLIST.body}
            </Typography>

            <TextField
              label={WAITLIST.emailLabel}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError(null);
              }}
              error={Boolean(emailError)}
              helperText={emailError ?? ' '}
              required
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': WAITLIST.emailLabel } }}
            />

            <FormControl fullWidth>
              <InputLabel id="waitlist-device-label">{WAITLIST.deviceLabel}</InputLabel>
              <Select
                labelId="waitlist-device-label"
                id="waitlist-device"
                label={WAITLIST.deviceLabel}
                value={device}
                onChange={(event) => setDevice(event.target.value)}
              >
                {WAITLIST.devices.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                      <span>{option}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Alert severity="info" variant="outlined" sx={{ borderRadius: '4px' }}>
              {WAITLIST.notWiredNotice}
            </Alert>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {WAITLIST.disclaimer}
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {status === 'editing' ? (
          <>
            <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" form="waitlist-form">
              {WAITLIST.submitLabel}
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={handleClose} fullWidth>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};