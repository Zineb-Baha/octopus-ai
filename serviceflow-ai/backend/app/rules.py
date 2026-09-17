def apply_business_rules(job: dict, customer_message: str):
    issues = []
    review_required = False

    message = customer_message.lower()

    if "collect" in message:
        if job["quality_check"] == "pending":
            issues.append(
                "The quality check is still pending."
            )
            review_required = True

    if (
        job["crm_state"] == "ready for collection"
        and job["quality_check"] == "pending"
    ):
        issues.append(
            "CRM says the vehicle is ready for collection, "
            "but the quality check is still pending."
        )
        review_required = True

    return {
        "issues": issues,
        "review_required": review_required
    }