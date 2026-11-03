import { Navigate } from 'react-router-dom';

/**
 * Registration is intentionally handled by the single Auth screen. Keeping a
 * second form here previously fabricated profile defaults and diverged from
 * the backend registration contract.
 */
const Register = () => <Navigate to="/auth?mode=register" replace />;

export default Register;
