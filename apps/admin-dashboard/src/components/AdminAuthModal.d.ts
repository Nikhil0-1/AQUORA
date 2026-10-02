import React from 'react';
import { FirebaseUser } from '../services/firebaseAuth';
interface Props {
    onAuthChange: (user: FirebaseUser | null) => void;
}
export declare function AdminAuthModal({ onAuthChange }: Props): React.JSX.Element;
export {};
