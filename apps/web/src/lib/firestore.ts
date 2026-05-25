import { getFirestore, collection, doc } from "firebase/firestore";
import { app } from "./firebase";

export const db = getFirestore(app);

export const col = {
  users:        ()                   => collection(db, "users"),
  institutions: ()                   => collection(db, "institutions"),
  units:        (institutionId: string) => collection(db, `institutions/${institutionId}/units`),
  auditLogs:    ()                   => collection(db, "audit_logs"),
};

export const ref = {
  user:        (uid: string)                             => doc(db, "users", uid),
  institution: (id: string)                              => doc(db, "institutions", id),
  unit:        (institutionId: string, unitId: string)   => doc(db, `institutions/${institutionId}/units`, unitId),
};
