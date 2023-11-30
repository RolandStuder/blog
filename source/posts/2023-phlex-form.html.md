---
title: Taking Phlex forms to the extreme
published: false
date: 2023-12-12
tags: []
---


class ExtremeForm::Form < ExtremeFormComponent
  action :post, :extreme_contacts_path

  field :first_name
  field :last_name
  method :post # path is derived from the class name: /extreme/form

  validates_presence_of :first_name, :last_name

  def initialize(user)
    @user = user
  end
  def template
    form(model: @user) do |form|
      form.text_field :first_name
      form.text_field :last_name
      form.submit "Save"
    end
  end

  def save
    return false if invalid?

    Contact.create(**attributes)
  end

  def update
    if save?
      redirect_to :root
    else
      render self
    end
  end
end

