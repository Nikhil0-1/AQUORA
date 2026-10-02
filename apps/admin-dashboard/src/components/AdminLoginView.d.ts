import React from 'react';
import { FirebaseUser } from '../services/firebaseAuth';
interface Props {
    onLoginSuccess: (user: FirebaseUser) => void;
}
export declare function AdminLoginView({ onLoginSuccess }: Props): React.JSX.Element;
export {};
