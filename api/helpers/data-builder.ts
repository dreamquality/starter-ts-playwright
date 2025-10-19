/**
 * Data Builder Pattern
 * Provides fluent interface for building test data
 */

export class UserBuilder {
  private user: any = {};

  withId(id: number): this {
    this.user.id = id;
    return this;
  }

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withUsername(username: string): this {
    this.user.username = username;
    return this;
  }

  withPhone(phone: string): this {
    this.user.phone = phone;
    return this;
  }

  withWebsite(website: string): this {
    this.user.website = website;
    return this;
  }

  withAddress(address: {
    street?: string;
    suite?: string;
    city?: string;
    zipcode?: string;
    geo?: { lat: string; lng: string };
  }): this {
    this.user.address = address;
    return this;
  }

  withCompany(company: {
    name?: string;
    catchPhrase?: string;
    bs?: string;
  }): this {
    this.user.company = company;
    return this;
  }

  build(): any {
    return { ...this.user };
  }
}

export class PostBuilder {
  private post: any = {};

  withId(id: number): this {
    this.post.id = id;
    return this;
  }

  withUserId(userId: number): this {
    this.post.userId = userId;
    return this;
  }

  withTitle(title: string): this {
    this.post.title = title;
    return this;
  }

  withBody(body: string): this {
    this.post.body = body;
    return this;
  }

  build(): any {
    return { ...this.post };
  }
}

export class CommentBuilder {
  private comment: any = {};

  withId(id: number): this {
    this.comment.id = id;
    return this;
  }

  withPostId(postId: number): this {
    this.comment.postId = postId;
    return this;
  }

  withName(name: string): this {
    this.comment.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.comment.email = email;
    return this;
  }

  withBody(body: string): this {
    this.comment.body = body;
    return this;
  }

  build(): any {
    return { ...this.comment };
  }
}

/**
 * Generic data builder for custom objects
 */
export class GenericBuilder<T = Record<string, any>> {
  private data: Record<string, any> = {};

  with(key: string, value: any): this {
    this.data[key] = value;
    return this;
  }

  withMany(obj: Record<string, any>): this {
    this.data = { ...this.data, ...obj };
    return this;
  }

  build(): T {
    return { ...this.data } as T;
  }
}
