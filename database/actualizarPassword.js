import { db } from './database';

export default function actualizarPassword(email, nuevaPassword) {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE usuarios SET password = ? WHERE email = ?",
        [nuevaPassword, email],
        () => resolve({ success: true }),
        () => resolve({ success: false })
      );
    });
  });
}
