"use client";
import AddTrainerForm from "@/components/admin/AddTrainerForm";

const AddTrainer = () => {
  return (
    <div className="max-w-xl mx-auto mt-12 p-8 rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Add Trainer</h2>
      <AddTrainerForm />
    </div>
  );
};

export default AddTrainer;
