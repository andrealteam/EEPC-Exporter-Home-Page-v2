import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSections, postSections } from "../services/authApi";
import Skeleton from "react-loading-skeleton";

const Section = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const memberId = location.state?.memberId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const {
    data: sections,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["sections"],
    queryFn: getSections,
  });

  const mutation = useMutation({
    mutationFn: postSections,
    onSuccess: () => {
      navigate("/edit");
    },
  });

  const onSubmit = (data) => {
    const selectedSectionIds = Object.entries(data)
      .filter(([key, value]) => key.startsWith("section_") && value === true)
      .map(([key]) => parseInt(key.replace("section_", ""), 10));

    if (selectedSectionIds.length === 0) return;

    mutation.mutate({
      memberId: memberId,
      sectionList: selectedSectionIds,
    });
  };

  if (isError) {
    return <p>Error: {error?.message || "Something went wrong!"}</p>;
  }

  return (
    <>
      {isLoading ? (
        <Skeleton height={600} />
      ) : (
        <div className="center-screen">
          <div className="popup-container">
            <h3>Select Sections</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                {sections?.map((section) => (
                  <div key={section.id} className="checkbox-container">
                    <input
                      type="checkbox"
                      id={`section_${section.id}`}
                      {...register(`section_${section.id}`)}
                    />
                    <label htmlFor={`section_${section.id}`}>
                      {section.section}
                    </label>
                  </div>
                ))}
                {mutation.isError && (
                  <p style={{ color: "red" }}>
                    Submission failed. Please try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn"
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Section;
