import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    fetch("/admin/documents")
      .then(r => r.json())
      .then(setDocs);
  }, []);

  return (
    <div>
      <h2>Pending Documents</h2>
      {docs.map(d => (
        <div key={d.document_id}>
          <p>{d.phone_number} - {d.document_type}</p>
          <button onClick={() => approve(d.document_id)}>Approve</button>
          <button onClick={() => reject(d.document_id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
