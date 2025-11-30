import { db } from './database';

export default function buscarUsuarioPorCorreo(email) {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        (_, { rows }) => resolve(rows.length > 0 ? rows.item(0) : null),
        () => resolve(null)
      );
    });
  });
}
