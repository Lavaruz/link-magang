import { Request, Response } from "express";
import Post from "../models/Post";
import { encrypt, decrypt } from "../config/crypto";
import Skills from "../models/Skills";
import Locations from "../models/Locations";


export const getAllPost = async (req: Request, res: Response) => {
    try {
      const search = req.query.search || ""
      const post_date = req.query.post_date || "DESC"
      let skills:any = req.query.skills || "[]"
      let type:any = req.query.type || "[]"
      let locations:any = req.query.locations || "[]"

      let db_page = req.query.page || 1
      let db_limit = req.query.limit || 20
      locations = JSON.parse(locations)
      type = JSON.parse(type)
      skills = JSON.parse(skills)

      if (search !== "" || locations.length > 0 || skills.length > 0 || type.length > 0) {
        db_limit = 999;
      }

      const POST = await Post.findAll({
        attributes:{exclude:[ "updatedAt"]},
        limit: +db_limit,
        offset: (+db_page - 1) * +db_limit,
        order: [["post_date", post_date.toString()]],
        include: [
          {model: Skills, as:"skills"},
        ]
      })

      let filtered_data = POST.filter(post => {
        let post_json = post.toJSON();
        const matchesSearch = post_json.title.toLowerCase().includes(search.toString().toLowerCase()) || post_json.company.toLowerCase().includes(search.toString().toLowerCase());
  
        return matchesSearch;
      })
      

      const total_entries = filtered_data.length;
      const total_pages = Math.ceil(total_entries / +db_limit);

      let encryptedData = encrypt({
        limit: db_limit,
        page: db_page,
        total_page: total_pages,
        datas: filtered_data
      }, process.env.AES_KEYS)

      return res.status(200).json(encryptedData)
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

export const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id
  try {
    const POST = await Post.findByPk(postId, {
      include: [
        {model: Skills, as: "skills"}
      ]
    })
    const encryptedData = encrypt(POST)
    return res.status(200).json(encryptedData)
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const getAllPostCount = async (req: Request, res: Response) => {
    try {
      const POST = await Post.count()
      return res.status(200).json(POST)
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

export const getPostCount = async (req: Request, res: Response) => {
  const platform = req.query.platform 
  try {
    const POST = await Post.count({
      where: {
        platform: platform
      }
    })
    return res.status(200).json(POST)
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addPost = async (req: Request, res: Response) => {
  const postData = req.body; // Data pembaruan pengguna dari permintaan PUT  
  const skillBody = req.body.skills.split(",")

  try {
    let POST = await Post.findOne({ where: { link: postData.link } })
    if(POST) return res.status(400).json({message: "Post already exist"})

    const NEW_POST = await Post.create(postData)
    const SKILLS = await Skills.findAll({where: { id: skillBody}})
    await NEW_POST.setSkills(SKILLS)
     
    return res.sendStatus(201)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message });
  }
};

export const updatePosts = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const updatedPost = req.body; // Data pembaruan pengguna dari permintaan PUT  

  try {
    const post = await Post.findByPk(postId);
    if (post) {
      await post.update(updatedPost);
      return res.sendStatus(200)
    } else {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message });
  }
};

export const DeletePost = async (req: Request, res: Response) => {
  const postId = req.params.id
  const POST = await Post.findByPk(postId)
  
  try{
    if (POST) {
      POST.destroy()
      return res.sendStatus(200)
    } else {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message });
  }
};