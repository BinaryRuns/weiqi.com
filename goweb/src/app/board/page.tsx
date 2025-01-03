import React from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'; // Adjust path as needed


//SOME testing for ALERT component
const BasicAlertDialog = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="btn">Show Alert</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alert Title</AlertDialogTitle>
          <AlertDialogDescription>
            This is the alert message. Please read it carefully.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Ok</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BasicAlertDialog;
