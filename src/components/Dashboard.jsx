import React from 'react';

const Dashboard = () => {
    
    const userName = localStorage.getItem('userName') || 'User';

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0" style={{ borderRadius: '20px' }}>
                <h1 className="text-primary">Welcome, {userName}!</h1>
                <p className="lead">SecureLaw AI Gateway එකට සාර්ථකව සම්බන්ධ වුණා.</p>
                <hr />
                <div className="row">
                    <div className="col-md-4">
                        <div className="card p-3 bg-light border-0 shadow-sm">
                            <h5>Recent Logins</h5>
                            <p>ඔයාගේ IP සහ Device විස්තර සේව් වෙලා තියෙන්නේ.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;