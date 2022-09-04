import { useAuth } from "../../context/auth";

export function DriveAccount() {

    const { user } = useAuth();

    return (
        <div style={{position: 'absolute', right: '0', top: '0'}}>
            {user.username}
        </div>
    )

}